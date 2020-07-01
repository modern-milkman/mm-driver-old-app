CUR_SPACE=.

version=`grep -E "\"version\":\s?\".*\"" package.json | sed s/[^0-9.]//g`;
versionCode=`grep -E "\"versionCode\":\s?\".*\"" package.json | sed s/[^0-9.]//g`;
echo "Infusing version $version-$versionCode to environment files";

sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.development
sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.production
sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.staging

sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.development
sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.production
sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.staging

find . -name *.*-e -exec rm -rf {} \;
