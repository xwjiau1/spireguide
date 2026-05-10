#!/bin/bash
# SpireGuide 构建脚本
# 构建前端 + 后端，输出到 06-交付/build/

set -e

echo "=== SpireGuide 构建开始 ==="

PROJECT_ROOT="/root/.openclaw/workspace/tech/projects/slay-spire-guide"
SRC_DIR="$PROJECT_ROOT/03-源码/src"
BUILD_DIR="$PROJECT_ROOT/06-交付/build"

# 清理旧构建
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 1. 构建前端
echo "[1/4] 构建前端..."
cd "$SRC_DIR/frontend"
npm run build

# 2. 构建后端（TypeScript编译）
echo "[2/4] 编译后端..."
cd "$SRC_DIR/backend"
npx tsc --outDir "$BUILD_DIR/dist"

# 3. 复制前端产物到后端 public 目录
echo "[3/4] 合并前端产物..."
mkdir -p "$BUILD_DIR/dist/public"
cp -r "$SRC_DIR/frontend/dist/"* "$BUILD_DIR/dist/public/"

# 4. 复制数据库和种子数据
echo "[4/4] 复制数据库..."
cp -r "$SRC_DIR/backend/data" "$BUILD_DIR/dist/" 2>/dev/null || mkdir -p "$BUILD_DIR/dist/data"
cp -r "$SRC_DIR/backend/uploads" "$BUILD_DIR/dist/" 2>/dev/null || mkdir -p "$BUILD_DIR/dist/uploads"

# 5. 复制 package.json 并精简依赖
cp "$SRC_DIR/backend/package.json" "$BUILD_DIR/dist/package.json"

# 6. 创建启动脚本
cat > "$BUILD_DIR/start.sh" << 'EOF'
#!/bin/bash
# SpireGuide 生产启动脚本
export NODE_ENV=production
export PORT=3001
cd "$(dirname "$0")/dist"
node index.js
EOF
chmod +x "$BUILD_DIR/start.sh"

echo ""
echo "=== 构建完成 ==="
echo "构建产物路径: $BUILD_DIR"
echo "启动命令: bash $BUILD_DIR/start.sh"
echo ""

# 统计大小
echo "产物大小统计:"
du -sh "$BUILD_DIR"/* 2>/dev/null || true
du -sh "$BUILD_DIR/dist" 2>/dev/null || true
