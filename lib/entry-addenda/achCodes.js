var _ = require('lodash');

const returnCodes = {
  01: 'Insufficient funds',
  02: 'Account closed',
  03: 'No account/unable to locate account',
  04: 'Invalid Account Number',
  05: 'Reserved',
  06: 'Returned per ODFIs request',
  07: 'Authorization revoked by customer',
  08: 'Payment stopped or stop payment on item',
  09: 'Uncollected Funds',
  10: 'Customer advises not authorized',
  11: 'Check truncation entry return',
  12: 'Branch sold to another DFI',
  13: 'RDFI not qualified to participate',
  14: 'Representment payee deceased or unable to continue in that capacity',
  15: 'Beneficiary of account holder deceased',
  16: 'Account frozen',
  17: 'File record edit criteria',
  18: 'Improper effective entry date',
  19: 'Amount field error',
  20: 'Non-transaction Account',
  21: 'Invalid company identification',
  22: 'Invalid individual ID number',
  23: 'Credit entry refused by receiver',
  24: 'Duplicate entry',
  25: 'Addenda error',
  26: 'Mandatory field error',
  27: 'Trace number error',
  28: 'Routing number check digit error',
  29: 'Corporate customer advises not authorized',
  30: 'RDFI not participant in check truncation program',
  31: 'Permissible return entry',
  32: 'RDFI non-settlement',
  33: 'Return of XCK entry',
  34: 'Limited participation DFI',
  35: 'Return of improper debit entry',
  36: 'Return of improper credit entry',
  40: 'Return of ENR entry by federal government agency (ENR Only)',
  41: 'Invalid transaction code (ENR Only)',
  42: 'Routing number/check digit error (ENR only)',
  43: 'Invalid DFI account number (ENR only)',
  44: 'Invalid individual ID number (ENR only)',
  45: 'Invalid individual name/company name (ENR only)',
  46: 'Invalid representative payee indicator (ENR only)',
  47: 'Duplicate enrollment',
  50: 'State law affecting RCK acceptance',
  51: 'Item is ineligible, notice not provided, signature not genuine',
  52: 'Stop payment on item',
  61: 'Misrouted return',
  62: 'Incorrect trace number',
  63: 'Incorrect dollar amount',
  64: 'Incorrect individual identification',
  65: 'Incorrect transaction code',
  66: 'Incorrect company identification',
  67: 'Duplicate return',
  68: 'Untimely return',
  69: 'Multiple errors',
  70: 'Permissible return entry not accepted',
  71: 'Misrouted dishonored return',
  72: 'Untimely dishonored return',
  73: 'Timely original return',
  74: 'Corrected return',
  80: 'Cross-border payment coding error',
  81: 'Non-participant in cross-border program',
  82: 'Invalid foreign receiving DFI Identification',
  83: 'Foreign receiving DFI unable to settle',
}

const nocCodes = {
  01: 'Incorrect bank account number', // Bank account number incorrect or formatted incorrectly
  02: 'Incorrect transit/routing number', // Once valid transit/routing number must be changed
  03: 'Incorrect transit/routing number and bank account number', // Once valid transit/routing number must be changed and causes a change to bank account number structure
  04: 'Bank account name change', // Customer has changed name or ODFI submitted name incorrectly
  05: 'Incorrect payment code', // Entry posted to demand account should contain savings payment codes or vice versa
  06: 'Incorrect bank account number and transit code', // Bank account number must be changed and payment code should indicate posting to another account type (demand/savings)
  07: 'Incorrect transit/routing number, bank account number and payment code', // Changes required in three fields indicated
  09: 'Incorrect individual ID number', // Individual's ID number is incorrect).
  10: 'Incorrect company name', // Company name is no longer valid and should be changed.
  11: 'Incorrect company identification', // Company ID is no longer valid and should be changed
  12: 'Incorrect company name and company ID', // Both the company name and company id are no longer valid and must be changed
}

const NOTIFICATION_OF_CHANGE =  98;
const RETURN_STATUS = 99;

const isAddendaReturn = addendaTypeCode => addendaTypeCode == NOTIFICATION_OF_CHANGE || addendaTypeCode == RETURN_STATUS;

const getReason = (codeStr) => {
  if (!_.isEmpty(codeStr)) {
    const codeType = codeStr[0];
    const codeNumber = Number(codeStr.slice(1));
    if (codeType == 'R') {
      return returnCodes[codeNumber];
    }
    if (codeType == 'C') {
      return nocCodes[codeNumber];
    }
  }

  return 'Unknown Reason';
}


module.exports = {
  isAddendaReturn,
  getReason,
};
