#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 开始全面构建检查...\n');

const checks = [
  {
    name: 'TypeScript 类型检查',
    command: 'npx tsc --noEmit',
    emoji: '📝'
  },
  {
    name: 'ESLint 代码检查',
    command: 'npx next lint',
    emoji: '🔧'
  },
  {
    name: 'Next.js 构建测试',
    command: 'npx next build',
    emoji: '⚡'
  }
];

let hasErrors = false;
const results = [];

for (const check of checks) {
  console.log(`${check.emoji} 运行 ${check.name}...`);
  
  try {
    const output = execSync(check.command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5分钟超时
    });
    
    results.push({
      name: check.name,
      status: '✅ 通过',
      output: output.trim()
    });
    
    console.log(`   ✅ ${check.name} 通过\n`);
  } catch (error) {
    hasErrors = true;
    
    results.push({
      name: check.name,
      status: '❌ 失败',
      output: error.stdout || error.stderr || error.message
    });
    
    console.log(`   ❌ ${check.name} 失败:`);
    console.log(`   ${error.stdout || error.stderr || error.message}\n`);
  }
}

console.log('\n='.repeat(50));
console.log('📊 检查结果汇总:');
console.log('='.repeat(50));

results.forEach(result => {
  console.log(`${result.status} ${result.name}`);
  if (result.status.includes('❌') && result.output) {
    console.log(`   错误详情: ${result.output.slice(0, 200)}${result.output.length > 200 ? '...' : ''}`);
  }
});

if (hasErrors) {
  console.log('\n❌ 构建检查失败，请修复以上错误后再部署到Vercel');
  process.exit(1);
} else {
  console.log('\n✅ 所有检查通过！可以安全部署到Vercel');
  process.exit(0);
}