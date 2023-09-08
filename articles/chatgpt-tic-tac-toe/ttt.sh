#!/bin/bash

# Initialize the board
#board=(" ", " ", " ", " ", " ", " ", " ") # original chat gpt off-by-one error

board=(" " " " " " " " " " " " " " " " " ")

#board=(" " " " " " " " " " " " " " " " " ") # proclaimed error
board=(" " " " " " " " " " " " " " " ")
#board=(" " " " " " " " " " " ") #proclaimed fix


# Function to display the board
display_board() {
  echo " ${board[0]} | ${board[1]} | ${board[2]} "
  echo "-----------"
  echo " ${board[3]} | ${board[4]} | ${board[5]} "
  echo "-----------"
  echo " ${board[6]} | ${board[7]} | ${board[8]} "
}

# Function to check if the game is a draw
check_draw() {
  for space in "${board[@]}"; do
    if [[ $space == " " ]]; then
      return 1
    fi
  done
  return 0
}

# Function to check if the player has won
check_win() {
  # Check rows
  if [[ ${board[0]} == $1 && ${board[1]} == $1 && ${board[2]} == $1 ]]; then
    return 0
  elif [[ ${board[3]} == $1 && ${board[4]} == $1 && ${board[5]} == $1 ]]; then
    return 0
  elif [[ ${board[6]} == $1 && ${board[7]} == $1 && ${board[8]} == $1 ]]; then
    return 0
  fi
  # Check columns
  if [[ ${board[0]} == $1 && ${board[3]} == $1 && ${board[6]} == $1 ]]; then
    return 0
  elif [[ ${board[1]} == $1 && ${board[4]} == $1 && ${board[7]} == $1 ]]; then
    return 0
  elif [[ ${board[2]} == $1 && ${board[5]} == $1 && ${board[8]} == $1 ]]; then
    return 0
  fi
  # Check diagonals
  if [[ ${board[0]} == $1 && ${board[4]} == $1 && ${board[8]} == $1 ]]; then
    return 0
  elif [[ ${board[2]} == $1 && ${board[4]} == $1 && ${board[6]} == $1 ]]; then
    return 0
  fi
  return 1
}

# Function to check if the move is valid
check_valid_move() {
  if [[ $1 -lt 0 || $1 -gt 8 ]]; then
    # Invalid index
    return 1
  elif [[ ${board[$1]} != " " ]]; then
    # Space already occupied
    return 1
  else
    return 0
  fi
}

# Function to make a move for the computer
make_computer_move() {
  # Check if computer can win in one move
  for i in "${!board[@]}"; do
    if [[ ${board[$i]} == " " ]]; then
      board[$i]="O"
      if check_win "O"; then
        return 0
      else
        board[$i]=" "
      fi
    fi
  done
  # Check if player can win in one move and block it
  for i in "${!board[@]}"; do
    if [[ ${board[$i]} == " " ]]; then
      board[$i]="X"
      if check_win "X"; then
        board[$i]="O"
        return 0
      else
        board[$i]=" "
      fi
    fi
  done
  # Check if center square is available and take it
  if [[ ${board[4]} == " " ]]; then
    board[4]="O"
    return 0
  fi
  # Check if any corner square is available and take it
  if [[ ${board[0]} == " " ]]; then
    board[0]="O"
    return 0
  elif [[ ${board[2]} == " " ]]; then
    board[2]="O"
    return 0
  elif [[ ${board[6]} == " " ]]; then
    board[6]="O"
    return 0
  elif [[ ${board[8]} == " " ]]; then
    board[8]="O"
    return 0
  fi
  # Take any remaining square
  for i in "${!board[@]}"; do
    if [[ ${board[$i]} == " " ]]; then
      board[$i]="O"
      return 0
    fi
  done
}

# Game loop
while true; do
  # Display the board
  display_board

  # Player's turn
  read -p "Enter your move (0-8): " move
  if ! check_valid_move $move; then
    echo "Invalid move! Try again."
    continue
  fi
  board[$move]="X"
  if check_win "X"; then
    echo "You won!"
    display_board
    exit 0
  fi
  if check_draw; then
    echo "It's a draw!"
    display_board
    exit 0
  fi

  # Computer's turn
  make_computer_move
  if check_win "O"; then
    echo "Computer won!"
    display_board
    exit 0
  fi
  if check_draw; then
    echo "It's a draw!"
    display_board
    exit 0
  fi
done

