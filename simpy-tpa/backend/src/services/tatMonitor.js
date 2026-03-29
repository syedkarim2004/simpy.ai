const cron = require('node-cron');
const PreAuth = require('../models/PreAuth');

/**
 * TAT Monitor Service
 * Runs every 5 minutes to detect breached Pre-Auth cases (over 1 hour since submission)
 */
const initTATMonitor = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[TAT_MONITOR] Checking for breached cases...');
    
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const breachedCases = await PreAuth.find({
        status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
        submittedAt: { $lt: oneHourAgo },
        tatBreached: false
      });

      if (breachedCases.length > 0) {
        console.log(`[TAT_MONITOR] Found ${breachedCases.length} breached cases. Updating status...`);
        
        for (const c of breachedCases) {
          await PreAuth.findByIdAndUpdate(c._id, { tatBreached: true });
          // In a real app, you'd send an email/notification here
          // notifier.sendAlert(c.claimId, 'TAT_BREACHED')
        }
      }
    } catch (err) {
      console.error('[TAT_MONITOR] Error during TAT check:', err);
    }
  });
};

module.exports = initTATMonitor;
