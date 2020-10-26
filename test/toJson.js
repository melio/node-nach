var chai = require('chai')
  , _ = require('lodash')
  , expect = chai.expect;

const File = require('../lib/file');

describe('to json', function () {
  describe('convert to json', function () {
  it("expected addendas returns", async () => {

    const achFile = await File.parseFile(__dirname + '/svb_ach_return.txt');

    const j = achFile.toJson();
    expect(Object.is(j));

    const r01 = j.batches[0].entries[0].addendas[0];
    expect(r01.addendaTypeCode).to.equal("99");
    expect(r01.relatedInfo.code).to.equal("R01");

    const c03 = j.batches[1].entries[0].addendas[0];
    expect(c03.addendaTypeCode).to.equal("98");
    expect(c03.relatedInfo.code).to.equal("C03");
    expect(c03.relatedInfo.correctedData.routingNumber).to.equal("051400549");
    expect(c03.relatedInfo.correctedData.accountNumber).to.equal("2018413280533");

    const r03 = j.batches[2].entries[0].addendas[0];
    expect(r03.addendaTypeCode).to.equal("99");
    expect(r03.relatedInfo.code).to.equal("R03");

    const r04 = j.batches[3].entries[0].addendas[0];
    expect(r04.addendaTypeCode).to.equal("99");
    expect(r04.relatedInfo.code).to.equal("R04");

    const r01a = j.batches[4].entries[0].addendas[0];
    expect(r01a.addendaTypeCode).to.equal("99");
    expect(r01a.relatedInfo.code).to.equal("R01");
  });

  it("parse NOC", async () => {

    const achFile = await File.parseFile(__dirname + '/svb_noc.txt');

    const j = achFile.toJson();
    expect(Object.is(j));
    const noc = j.batches[0].entries[0].addendas[0];
    expect(noc.addendaTypeCode).to.equal('98');
    expect(noc.relatedInfo.code).to.equal("C02");
    expect(noc.relatedInfo.correctedData.routingNumber).to.equal("121042882");

  });
});

});