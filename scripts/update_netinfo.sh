CUR_SPACE=.

echo "Switching @react-native-community/netinfo fetch method from HEAD to GET";
echo "node_modules/@react-native-community/netinfo/src/internal/internetReachability.ts";
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "use extra caution if just upgraded @react-native-community/netinfo"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!"

sed -i -e "s/method: 'HEAD'/method: 'GET'/" $CUR_SPACE/node_modules/@react-native-community/netinfo/src/internal/internetReachability.ts

find . -name *.*-e -exec rm -rf {} \;
