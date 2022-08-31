const cron = require('node-cron');
const scrapeDataAndWriteToFile = require('./app');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.auth,
});

const owner = 'orrymevorach';
const repo = 'rhcp-api';

const getCurrentCommit = async () => {
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
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  };
};

const createCommit = async ({ treeSha, commitSha }) => {
  const result = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: 'committing new set list',
    tree: treeSha,
    parents: [commitSha],
  });
  return { sha: result.data.sha };
};

const pushCommit = async function (sha) {
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

  return result;
};

async function commitNewFiles() {
  const { treeSha, commitSha } = await getCurrentCommit();
  const { sha } = await createCommit({ treeSha, commitSha });
  await pushCommit(sha);
}

const task = cron.schedule('* * * * *', async () => {
  console.log('Running cron job');
  await scrapeDataAndWriteToFile();
  await commitNewFiles();
});

task.start();
