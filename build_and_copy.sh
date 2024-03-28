#!/bin/bash

# Ensure the build process runs successfully
if ! anchor build; then
  echo "Build failed. Exiting..."
  exit 1
fi

# Define the source and destination directories
src_dir="./target"
backend_dest_dir="apps/backend/src/solana/types"
frontend_dest_dir="apps/frontend/types"

# Copy the files with error handling
if ! cp "$src_dir/idl/sol_saver.json" "$backend_dest_dir"; then
  echo "Error copying sol_saver.json to backend."
  exit 1
fi

if ! cp "$src_dir/idl/sol_token_saver.json" "$backend_dest_dir"; then
  echo "Error copying sol_saver.json to backend."
  exit 1
fi

if ! cp "$src_dir/types/sol_saver.ts" "$backend_dest_dir"; then
  echo "Error copying sol_saver.ts to frontend."
  exit 1
fi

if ! cp "$src_dir/types/sol_token_saver.ts" "$backend_dest_dir"; then
  echo "Error copying sol_saver.ts to frontend."
  exit 1
fi

if ! cp "$src_dir/types/sol_saver.ts" "$frontend_dest_dir"; then
  echo "Error copying sol_saver.ts to frontend."
  exit 1
fi

if ! cp "$src_dir/types/sol_token_saver.ts" "$frontend_dest_dir"; then
  echo "Error copying sol_saver.ts to frontend."
  exit 1
fi


echo "Build outputs copied successfully!"
