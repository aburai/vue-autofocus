set -e
echo "Enter release version: "
read -r VERSION

read -p "Releasing v$VERSION - are you sure? (y/N)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing v$VERSION ..."
  # npm test

  # commit
  VERSION=$VERSION npm run build
  git add dist
  git commit -m "build: bundle $VERSION"

  # bump the version and write it to package.json
  # create a version commit and tag
  npm version "$VERSION" -m "chore(release): %s"

  # changelog
  # npm run changelog
  echo "Please check the git history and the changelog and press enter"
  read -r
  git add CHANGELOG.md
  git commit -m "chore(changelog): $VERSION"

  # publish
  git push origin refs/tags/v"$VERSION"
  git push
  npm publish --access=public
fi
