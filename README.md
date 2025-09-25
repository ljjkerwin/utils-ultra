# Utils Ultra

一个功能全面的JavaScript工具库，使用TypeScript编写，提供常用的工具函数。

## 特性

- 🚀 使用TypeScript编写，提供完整的类型支持
- 🧪 完整的Jest单元测试覆盖
- 📦 支持CommonJS和ES模块
- 🔧 包含ESLint代码检查
- 📖 完整的API文档和类型声明

## 安装

```bash
pnpm add utils-ultra
```

## 使用

```typescript
import { demoIsObject } from 'utils-ultra';

// 判断是否为非空对象
console.log(demoIsObject({ a: 1 })); // true
console.log(demoIsObject(null)); // false
console.log(demoIsObject([])); // false
```

## API文档

### 类型判断工具

- `demoIsObject(value)` - 判断是否为非空对象

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 构建
pnpm run build

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm run test:watch

# 测试覆盖率
pnpm run test:coverage

# 代码检查
pnpm run lint

# 修复代码格式
pnpm run lint:fix
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT