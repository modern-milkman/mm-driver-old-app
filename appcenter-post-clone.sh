CUR_SPACE=.

if [ "$APPEND_APPCENTER_BUILD_ID" = "true" ]
then
  printf "Adding APPCENTER_BUILD_ID to version number"
  printf "\n\n"
  version=`grep -E "\"version\":\s?\".*\"" $CUR_SPACE/package.json | sed s/[^0-9.]//g`;
  sed -i -e 's/"version":.*/"version": "'$version'.'$APPCENTER_BUILD_ID'",/' $CUR_SPACE/package.json
fi

echo "uninstalling all cocoapods versions"
sudo gem uninstall cocoapods --all
sudo gem install cocoapods -v 1.14.3
