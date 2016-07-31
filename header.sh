#!/bin/bash

shopt -s globstar nullglob extglob

for f in **/*.@(HEAD); do
  cat "./LICENSE.HEAD" $f > $f.new
  mv $f.new $f
done
