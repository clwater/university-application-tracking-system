#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 批量修复API文件中的环境变量...');

// 查找所有API文件
const apiFiles = [
  'app/api/**/*.ts',
  'lib/api-*.ts'
];

// 需要替换的模式
const replacements = [
  {
    from: /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL!/g,
    to: `import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()`
  },
  {
    from: /const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!/g,
    to: 'const supabaseServiceKey = getSupabaseServiceKey()'
  },
  {
    from: /const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!/g,
    to: `import { getSupabaseAnonKey } from '@/lib/env'

const supabaseAnonKey = getSupabaseAnonKey()`
  }
];

// 处理每个模式的文件
apiFiles.forEach(pattern => {
  const files = glob.sync(pattern);
  
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 已更新: ${filePath}`);
    }
  });
});

console.log('🎉 环境变量修复完成！');