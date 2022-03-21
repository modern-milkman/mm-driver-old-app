CUR_SPACE=.
CUR_FOLDER=$CUR_SPACE/src/process/locales
echo "Infusing locize translations to src/process/locales";

echo "" > $CUR_FOLDER/en/index.js
declare -a namespaces
namespacesIndex=1

FILES=`find $CUR_FOLDER/en -name "*.json" 2>/dev/null`

for fname in ${FILES[@]}
do
  namespace=`echo $fname | cut -d. -f2 | rev | cut -d/ -f1 | rev`
  echo "import $namespace from './$namespace'; " >> $CUR_FOLDER/en/index.js
  namespaces[$namespacesIndex]=$namespace
  namespacesIndex=`expr $namespacesIndex + 1`
done

printf -v var "%s, " "${namespaces[@]}"
var="${var%, }"
echo "export default { $var };" >> $CUR_FOLDER/en/index.js

cp $CUR_FOLDER/en/index.js $CUR_FOLDER/fr/index.js

echo "Infusing locize translations from src/process/locales/__/ios to strings files";
CUR_IOS_STRINGS_FOLDER=./ios

cp $CUR_FOLDER/en/ios.json $CUR_IOS_STRINGS_FOLDER/en.lproj/InfoPlist.strings
sed -i .bak 's/{//g; s/}//g; s/:/=/g; s/,//g; /^$/d; s/$/;/;' $CUR_IOS_STRINGS_FOLDER/en.lproj/InfoPlist.strings
rm -rf $CUR_IOS_STRINGS_FOLDER/en.lproj/InfoPlist.strings.bak

cp $CUR_FOLDER/fr/ios.json $CUR_IOS_STRINGS_FOLDER/fr.lproj/InfoPlist.strings
sed -i .bak 's/{//g; s/}//g; s/:/=/g; s/,//g; /^$/d; s/$/;/;' $CUR_IOS_STRINGS_FOLDER/fr.lproj/InfoPlist.strings
rm -rf $CUR_IOS_STRINGS_FOLDER/fr.lproj/InfoPlist.strings.bak
