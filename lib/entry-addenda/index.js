// Entry

var _ = require('lodash');
var utils = require('./../utils');
var validate = require('./../validate');

var highLevelOverrides = ['addendaTypeCode', 'paymentRelatedInformation', 'addendaSequenceNumber', 'entryDetailSequenceNumber'];

const achCodes = require('./achCodes');

function EntryAddenda(options, autoValidate) {

  // Allow the file header defaults to be overriden if provided
  this.fields = options.fields ? _.merge(options.fields, require('./fields'), _.defaults) : _.cloneDeep(require('./fields'));

  // Set our high-level values
  utils.overrideLowLevel(highLevelOverrides, options, this);

  // Some values need special coercing, so after they've been set by overrideLowLevel() we override them
  if (options.returnCode) {
    this.fields.returnCode.value = options.returnCode.slice(0, this.fields.returnCode.width);
  }

  if (options.paymentRelatedInformation) {
    this.fields.paymentRelatedInformation.value = options.paymentRelatedInformation.slice(0, this.fields.paymentRelatedInformation.width);
  }

  if (options.addendaSequenceNumber) {
    this.fields.addendaSequenceNumber.value = Number(options.addendaSequenceNumber);
  }

  if (options.entryDetailSequenceNumber) {
    this.fields.entryDetailSequenceNumber.value = options.entryDetailSequenceNumber.slice(0 - this.fields.entryDetailSequenceNumber.width); // last n digits. pass
  }

  if (autoValidate !== false) {
    // Validate required fields have been passed
    this._validate();
  }

  return this;
}

EntryAddenda.prototype.generateString = function (cb) {
  utils.generateString(this.fields, function (string) {
    cb(string);
  });
};

EntryAddenda.prototype._validate = function () {

  // Validate required fields
  validate.validateRequiredFields(this.fields);

  // Validate the ACH code passed is actually valid
  validate.validateACHAddendaTypeCode(this.fields.addendaTypeCode.value);

  // Validate header field lengths
  validate.validateLengths(this.fields);

  // Validate header data types
  validate.validateDataTypes(this.fields);
};

EntryAddenda.prototype.get = function (category) {

  // If the header has it, return that (header takes priority)
  if (this.fields[category]) {
    return this.fields[category]['value'];
  }
};

EntryAddenda.prototype.set = function (category, value) {
  // If the header has the field, set the value
  if (this.fields[category]) {
    if (category == 'entryDetailSequenceNumber') {
      this.fields[category]['value'] = value.slice(0 - this.fields[category].width); // pass last n digits
    }
    else {
      this.fields[category]['value'] = value;
    }
  }
};

EntryAddenda.prototype.getReturnCode = function () {
  if (this.fields.paymentRelatedInformation.value || this.fields.paymentRelatedInformation.value.length > 0) {
    return this.fields.paymentRelatedInformation.value.slice(0, 3);
  }
  return '';
}


EntryAddenda.prototype.parseCorrectedData = function (code, additionalInformation) {
  const correctedData = additionalInformation
    .split(' ')
    .filter(x => x !== '');

  if (!code)
    return {};

  switch (code) {
    // Incorrect DFI Account Number
    case "C01": return { accountNumber: correctedData[0] };
    // Incorrect Routing Number
    case "C02": return { routingNumber: correctedData[0] };
    // Incorrect Routing Number and Incorrect DFI Account Number
    case "C03": {
      if (correctedData.length == 2) {
        return {
          routingNumber: correctedData[0],
          accountNumber: correctedData[1]
        }
      };
    } break;
    // Incorrect Individual Name
    case "C04": return { IndividualName: correctedData[0] };
    // Incorrect Transaction Code
    case "C05": return { transactionCode: parseInt(correctedData[0]) }
    // Incorrect DFI Account Number and Incorrect Transaction Code
    case "C06": {
      if (correctedData.length == 2) {
        return {
          accountNumber: correctedData[0],
          transactionCode: parseInt(correctedData[1])
        }
      };
    } break;
    // Incorrect Routing Number, Incorrect DFI Account Number, and Incorrect Transaction Code
    case "C07": {
      return {
        routingNumber: correctedData[0].slice(0, 9),
        accountNumber: correctedData[0].slice(9),
        transactionCode: parseInt(correctedData[1]),
      };
    } break;
    // Incorrect Individual Identification Number
    case "C09": return { individualIdNumber: correctedData[0] }
  };
};

EntryAddenda.prototype.getPaymentRelatedInformation = function () {

  const rawInfo = this.fields.paymentRelatedInformation.value;
  if (rawInfo || rawInfo.length > 0) {
    const code = rawInfo.substr(0, 3); // (0-2)

    const result = {
      codeType: rawInfo.substr(0, 1),
      code,
      reason: achCodes.getReason(code),
      originalEntryTraceNumber: rawInfo.substr(3, 15).trim(), // (3-17)
      dateOfDate: rawInfo.substr(18, 6), // (18-23)
      originalRDFI: rawInfo.substr(24, 8).trim(), // (24-31)
      additionalInformation: rawInfo.substr(32, 44).trim(), // (32-75)
      traceNumber: rawInfo.substr(76, 15).trim(), // (76-90)
    }

    if (result.codeType === 'C') {
      result.correctedData = this.parseCorrectedData(result.code, result.additionalInformation);
    }
    return result;
  }
  return {};
}


EntryAddenda.prototype.toJson = function () {
  const addenda = utils.getFields(this.fields);

  if (achCodes.isAddendaReturn(addenda.addendaTypeCode)) {
    addenda.relatedInfo = this.getPaymentRelatedInformation();
  }

  return addenda;
};

module.exports = EntryAddenda;
