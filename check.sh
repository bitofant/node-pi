#!/bin/bash

NPM="usb/local/bin/npm"
GIT="/usr/bin/git"

$GIT fetch origin
IS_BEHIND=$($GIT status | grep "branch is behind")

if [ "${#IS_BEHIND}" = "0" ]; then
  exit
fi

$NPM run stop
$GIT pull
$NPM run build
$NPM start
