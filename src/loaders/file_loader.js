import fs from 'fs'
import path from 'path'
import lodash from 'lodash'
import Promise from 'bluebird'
import pathing from '../pathing'
import { adaptToCallback } from '../util'
import Loader from './loader'

export default class FileLoader extends Loader {
  constructor(options) {
    super()

    this.updateOptions({
      files: {
        watch: true,
        searchPaths: pathing(),
      },
      ...options,
    })
  }

  formatterSuggested(options) {
    const name = path.basename(options.identifier)
    const dotIndex = name.lastIndexOf('.')

    return new Promise((resolve, reject) => {
      if (dotIndex > -1) {
        resolve(name.slice(dotIndex + 1))
      } else {
        this.find(options.identifier, true).then(resolve, reject)
      }
    })
  }

  findByPrefix(directory, fileName) {
    const readdir = Promise.promisify(fs.readdir)
    return new Promise((resolve, reject) => {
      readdir(directory)
        .then(fileNames => {
          resolve(
            fileNames.filter(name => {
              if (name.indexOf(fileName) === 0) return true
            }),
          )
        })
        .catch(err => reject(err))
    })
  }

  find(fileName, asPrefix = false, callback) {
    const { searchPaths } = this.options.files
    const promise = Promise.all(
      searchPaths.map(directory => {
        return new Promise((resolve, reject) => {
          const relativePath = path.join(directory, fileName)
          const absolutePath = path.resolve(relativePath)

          if (asPrefix) {
            const absoluteDirectoryPath = path.resolve(directory)
            const resolveMatches = matches => {
              resolve(
                matches.map(match => {
                  return path.join(absoluteDirectoryPath, match)
                }),
              )
            }

            this.findByPrefix(absoluteDirectoryPath, fileName).then(
              resolveMatches,
              reject,
            )
          } else {
            fs.exists(absolutePath, result => {
              if (result) resolve(absolutePath)
              else reject(absolutePath)
            })
          }
        }).reflect()
      }),
    ).then(paths => {
      return new Promise((resolve, reject) => {
        let matches = []

        for (const path of paths)
          if (path.isFulfilled()) matches = matches.concat(path.value())

        if (matches.length) resolve(matches)
        else reject(new Error(`No files found matching: ${fileName}`))
      })
    })

    return adaptToCallback(promise, callback)
  }

  get(fileName, callback) {
    const promise = new Promise((resolve, reject) => {
      fs.readFile(fileName, { encoding: 'UTF-8' }, (err, data) => {
        if (err) return reject(err)
        resolve({
          source: fileName,
          content: data,
        })
      })
    })

    return adaptToCallback(promise, callback)
  }

  // // watch does not reliably provide the fileName back to us, so this
  // // closure protects us from the situation where a fileName is not provided.
  getChangeHandler(fileName) {
    return event => {
      this.emit(event, fileName)
      this.get(fileName, (...args) => this.updated(...args))
    }
  }

  watch(fileName) {
    fs.watch(fileName, { persistent: false }, this.getChangeHandler(fileName))
  }

  load(requestedFileName, callback) {
    const dotIndex = path.basename(requestedFileName).lastIndexOf('.')
    const shouldDetermineFormat = dotIndex === -1

    const promise = new Promise((resolve, reject) => {
      let findPromise = this.find(requestedFileName, shouldDetermineFormat)

      return findPromise
        .then(files => lodash.first(files))
        .then(fileName => {
          if (this.options.files.watch) this.watch(fileName)
          return this.get(fileName)
        })
        .then(resolve)
        .catch(reject)
    })

    return adaptToCallback(promise, callback)
  }
}
