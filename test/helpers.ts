import * as chai from 'chai';
import * as sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

declare global {
  var expect: Chai.ExpectStatic;
  var sinonInstance: sinon.SinonStatic;
}

global.expect = chai.expect;
global.sinonInstance = sinon;
