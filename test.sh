#!/bin/bash

# Base URLs
reward_url="http://localhost:3000/admin/create-reward"
start_day_url="http://localhost:3000/admin/start-day"

# Pools you want to target
pools=(42 43)

# Loop for 25 repetitions
for ((i=1; i<=85; i++))
do
  # Generate a random APY value between 0.05 and 0.15 (inclusive)
  apy=$(awk -v min=0.05 -v max=0.15 'BEGIN{srand(); print min+rand()*(max-min)}')

  # Iterate through configured pools
  for pool in "${pools[@]}"
  do
    # Create reward endpoint request
    curl -X POST -H "Content-Type: application/json" \
         -d "{\"poolId\": ${pool}, \"apy\": ${apy}}" \
         ${reward_url}
  done

  # Start day endpoint request
  curl -X POST ${start_day_url}

  echo "Iteration ${i} complete." 
done