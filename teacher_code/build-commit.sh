# ./build-commit.sh

# 获取当前时间，并将其格式化为年月日时分秒的形式
time=$(date '+%Y%m%d%H%M%S')

# 获取 Git 仓库的最新 commit hash
hash=$(git rev-parse --short HEAD)

# 将 dist 目录重命名为时间+commit hash 的形式
mv dist dist_${time}_${hash}