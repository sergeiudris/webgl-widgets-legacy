#!/bin/bash



#commment 

shopt -s globstar nullglob extglob

for f in **/*.@(js); do
  cat "./LICENSE.HEAD" $f > $f.new
  mv $f.new $f
done
