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
    case "C04": return { individualName: correctedData[0] };
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
  const getField = (rawRelatedInformation, start, end) => {
    // start/end are the offsets as described in the ACH spec.
    // paymentRelatedInformation is offseted from the addenda start by 4 chars.
    const size = end - start + 1;
    return rawRelatedInformation.substr(start - 4, size).trim();
  };

  const rawInfo = this.fields.paymentRelatedInformation.value;
  if (rawInfo || rawInfo.length > 0) {
    const code = getField(rawInfo, 4, 6) // (7_4_6)

    const result = {
      code,
      codeType: code[0],
      reason: achCodes.getReason(code),
      originalEntryTraceNumber: getField(rawInfo, 7, 21), // (7_7_21)
      dateOfDate: getField(rawInfo, 22, 27), // (7_22_27)
      originalRDFI: getField(rawInfo, 28, 38), // (7_28_35)]
      additionalInformation: getField(rawInfo, 36, 79), // (7_36_79)
      traceNumber: getField(rawInfo, 80, 94), // (7_80_94)
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
