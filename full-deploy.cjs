const { execSync } = require('child_process');
const readline = require('readline');

function getChangedFiles() {
  try {
    const output = execSync('git status --porcelain').toString().trim();
    return output.length > 0;
  } catch (error) {
    console.error('Error checking git status:', error);
    process.exit(1);
  }
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    process.exit(1);
  }
}

function askCommitMessage(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('enter commit ', (answer) => {
    rl.close();
    callback(answer);
  });
}

if (!getChangedFiles()) {
  console.log('✅ هیچ تغییری برای commit وجود ندارد.');
  process.exit(0);
}

run('git add .');
askCommitMessage((msg) => {
  run(`git commit -m "${msg}"`);
  run('git push');
  run('npm run build');
  run('npm run deploy');
  console.log('\n🚀 done!');
});
