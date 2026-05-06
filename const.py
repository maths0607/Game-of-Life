WINDOW_DIMS = (800, 800)      # Dimensions of the window
MENU_WIDTH = 200                # Width of the menu
CELL_DIMS = (20, 20)            # Dimensions of cells
CELL_COUNT = ((WINDOW_DIMS[0] - MENU_WIDTH) // CELL_DIMS[0],    # Calculating the number of cells that
              WINDOW_DIMS[1] // CELL_DIMS[1])                   # fit into the board
BG_COLOR = (64, 64, 64)         # Background color of the board

# Padding between cells. Should be lower than the half of the smaller dimension of cells
CELL_PADDING = 1
BUTTON_HEIGHT = 40                  # Height of a button

# Padding between the left and right menu and button borders
BUTTON_PADDING = 0.05 * MENU_WIDTH
TEXT_FONT = 'arial'                 # Font of texts used
