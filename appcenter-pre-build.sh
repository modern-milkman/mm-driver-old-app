#!/usr/bin/env bash

# Example: Change bundle name of an iOS app for non-production
if [ "$PLATFORM" == "ios" ]
then
  cd ios && pod install;
elif [ "$PLATFORM" == "android" ]
then
  cd android && ./gradlew clean;
else
  echo "Unknown platform. Please specify either ios or android PLATFORM env variable."
  echo "Running both platforms for local development now"
  cd ios && pod install;
  cd ../android && ./gradlew clean;
fi