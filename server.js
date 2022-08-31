const express = require('express');
const task = require('./cron-job');

const app = express();
app.set('port', process.env.PORT || 3000);

// ADD CALL HERE
task.start();

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
