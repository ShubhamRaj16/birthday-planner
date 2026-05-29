// daysOffset: negative = days before event, 0 = day of
const TASK_DEFAULTS = [
  { title: 'Fix venue & date', category: 'venue', daysOffset: -60 },
  { title: 'Finalise guest list', category: 'invites/printing', daysOffset: -45 },
  { title: 'Send invitations', category: 'invites/printing', daysOffset: -30 },
  { title: 'Book caterer / order food', category: 'catering', daysOffset: -30 },
  { title: 'Order cake', category: 'cake', daysOffset: -21 },
  { title: 'Arrange decorations', category: 'decorations', daysOffset: -14 },
  { title: 'Confirm entertainment', category: 'entertainment', daysOffset: -14 },
  { title: 'Prepare return gifts', category: 'return gifts', daysOffset: -7 },
  { title: 'Confirm headcount with venue', category: 'venue', daysOffset: -3 },
  { title: 'Day-of setup', category: 'miscellaneous', daysOffset: 0 },
];

module.exports = TASK_DEFAULTS;
