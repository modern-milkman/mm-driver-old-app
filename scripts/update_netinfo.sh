CUR_SPACE=.
RED='\033[0;31m'
NC='\033[0m' # No Color
printf "\n\n${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}\n"
printf "${RED}use extra caution if just upgraded @react-native-community/netinfo${NC}\n"
printf "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}\n"
echo "Switching @react-native-community/netinfo fetch method from HEAD to GET";
echo "node_modules/@react-native-community/netinfo/src/internal/internetReachability.ts";
printf "\n\n"

sed -i -e "s/method: 'HEAD'/method: 'GET'/" $CUR_SPACE/node_modules/@react-native-community/netinfo/src/internal/internetReachability.ts

find . -name *.*-e -exec rm -rf {} \;
