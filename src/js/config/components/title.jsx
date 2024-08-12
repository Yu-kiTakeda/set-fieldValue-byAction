import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Title = ({title, description}) => {

  return (
    <Box width="100%" sx={{marginTop: '20px'}}>
      <Typography variant="h4" component="h1" textAlign="center">{title}</Typography>
      <p>{description}</p>
    </Box>
  );
}

export default Title;