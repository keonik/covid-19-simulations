echo 
echo 
echo '************************************************************************'
echo Removing old files
echo '************************************************************************'
echo

rm -rf *.zip GENDATA_OUTPUT/ ./public/data

MONTH_DAY=$(date -j -v -1d "+%-m-%-d")
FULL_PATH="https://s3.us-gov-west-1.amazonaws.com/ultraviz/${MONTH_DAY}.zip"


echo 
echo 
echo '************************************************************************'
echo "Downloading ${FULL_PATH}"
echo '************************************************************************'
echo


curl ${FULL_PATH} -O -J -L
unzip "${MONTH_DAY}.zip" && rm "${MONTH_DAY}.zip"

echo '************************************************************************'
echo Completed
echo '************************************************************************'