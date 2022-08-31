const cron = require('node-cron');
const scrapeDataAndWriteToFile = require('./app');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.auth,
});

const owner = 'orrymevorach';
const repo = 'rhcp-api';

const getCurrentCommit = async () => {
  console.log('Gettint current commit');
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/master`,
  });
  const commitSha = refData.object.sha;
  const { data: commitData } = await octokit.git.getCommit({
    owner: 'orrymevorach',
    repo: 'rhcp-api',
    commit_sha: commitSha,
  });
  console.log('Success');
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  };
};

const createCommit = async ({ treeSha, commitSha }) => {
  console.log('Creating commit');
  const result = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: 'committing new set list',
    tree: treeSha,
    parents: [commitSha],
  });

  console.log('Success');
  return { sha: result.data.sha };
};

const pushCommit = async function (sha) {
  console.log('Pushing commit');
  const result = await octokit.request(
    `PATCH /repos/${owner}/${repo}/git/refs/heads/master`,
    {
      owner,
      repo,
      ref: 'refs/heads/master',
      sha,
      //   force: true,
    }
  );
  console.log('Success');
  return result;
};

async function commitNewFiles() {
  const { treeSha, commitSha } = await getCurrentCommit();
  const { sha } = await createCommit({ treeSha, commitSha });
  await pushCommit(sha);
}

const task = cron.schedule('* * * * *', async () => {
  await scrapeDataAndWriteToFile();
  await commitNewFiles();
  console.log('Finished cron job');
});

task.start();
