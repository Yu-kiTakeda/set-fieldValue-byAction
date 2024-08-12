import React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function SaveButtons({saveFunc, cancelFunc}) {

  return (
    <Box spacing={3} padding={5}>
      <Stack direction="row" justifyContent="flex-end" spacing={3} sx={{paddingRight: '100px'}}>
        <Button variant="contained" color="primary" aria-label="save" onClick={saveFunc}>保存</Button>
        <Button variant="contained" color="error" aria-label="cancel" onClick={cancelFunc}>キャンセル</Button>
      </Stack>
    </Box>
  );
};


