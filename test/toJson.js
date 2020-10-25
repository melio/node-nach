var chai = require('chai')
  , _ = require('lodash')
  , expect = chai.expect;

const File = require('../lib/file');

describe('to json', function () {
  describe('convert to simple json', function () {
  it("make sure it doesn't blow-up", async () => {

    const achFile = await File.parseFile(__dirname + '/svb_ach_return.txt');

    const j = achFile.toJson();
    expect(Object.is(j));
    // console.log(JSON.stringify(j));

  });
});

});