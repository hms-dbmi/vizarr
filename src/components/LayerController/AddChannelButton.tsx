import { Divider, IconButton, NativeSelect, Paper, Popover, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React, { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";

import { useLayerState, useSourceData } from "../../hooks";
import { MAX_CHANNELS, calcDataRange, hexToRGB } from "../../utils";

function AddChannelButton() {
  const [source, setSource] = useSourceData();
  const [layer, setLayer] = useLayerState();
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    handleClose();
    const channelIndex = +event.target.value;
    const channelSelection = [...source.defaults.selection];
    if (source.channel_axis) {
      channelSelection[source.channel_axis] = channelIndex;
    }

    // cacluate contrast limits if missing from source;
    let lim: [min: number, max: number];
    if (source.contrast_limits[channelIndex]) {
      lim = source.contrast_limits[channelIndex] as [number, number];
    } else {
      const { loader } = layer.layerProps;
      const lowres = Array.isArray(loader) ? loader[loader.length - 1] : loader;
      lim = await calcDataRange(lowres, channelSelection);
      // Update source data with newly calculated limit
      setSource((prev) => {
        const clims = [...prev.contrast_limits];
        clims[channelIndex] = lim;
        return { ...prev, contrast_limits: clims };
      });
    }

    setLayer((prev) => {
      const { layerProps } = prev;
      const selections = [...layerProps.selections, channelSelection];
      const colors = [...layerProps.colors, hexToRGB(source.colors[channelIndex])];
      const contrastLimits = [...layerProps.contrastLimitsRange, lim];
      const channelsVisible = [...layerProps.channelsVisible, true];
      return {
        ...prev,
        layerProps: {
          ...layerProps,
          selections,
          colors,
          contrastLimits,
          contrastLimitsRange: [...contrastLimits],
          channelsVisible,
        },
      };
    });
  };

  const { names } = source;
  const open = Boolean(anchorEl);
  const id = open ? `layer-${source.id}-add-channel` : undefined;
  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-describedby={id}
        style={{
          backgroundColor: "transparent",
          padding: 0,
          zIndex: 2,
          cursor: "pointer",
        }}
        disabled={layer.layerProps.selections.length === MAX_CHANNELS}
      >
        <Add />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper style={{ padding: "0px 4px", marginBottom: 4, width: "8em" }}>
          <Typography variant="caption">selection: </Typography>
          <Divider />
          <NativeSelect
            fullWidth
            style={{ fontSize: "0.7em" }}
            id={`layer-${source.id}-channel-select`}
            onChange={handleChange}
          >
            <option aria-label="None" value="">
              None
            </option>
            {names.map((name, i) => (
              <option value={i} key={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </Paper>
      </Popover>
    </>
  );
}

export default AddChannelButton;
