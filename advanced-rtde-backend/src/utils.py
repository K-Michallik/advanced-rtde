from typing import Tuple


def set_digital_outputs(current_state: int, digital_output: int, value: int, offset: int = 0) -> Tuple[int, int]:
    """
    Sets a specific digital output to 0 or 1 and returns the new state of the digital outputs within the specified range
    and the mask of the changed bit.

    :param current_state: Current state of all digital outputs (UINT64)
    :param digital_output: Digital output to set (0-7)
    :param value: Value to set the digital output to (0 or 1)
    :param offset: Bit offset to specify which range of outputs to modify (default is 0 for standard outputs, 8 for configurable outputs)
    :return: Tuple containing new state of the digital outputs within the specified range (UINT8) and the mask (UINT8)
    """
    if digital_output < 0 or digital_output > 7:
        raise ValueError("Digital output must be in the range 0-7.")
    if value not in (0, 1):
        raise ValueError("Value must be 0 or 1.")

    # Adjust the mask to the appropriate bit range
    mask = 1 << (digital_output + offset)

    # Clear the bit at the digital output position
    current_state &= ~mask

    # Set the bit at the digital output position if value is 1
    if value == 1:
        current_state |= mask

    # Return the new state of the digital outputs within the specified range and the mask
    return (current_state >> offset) & 0xFF, (mask >> offset) & 0xFF