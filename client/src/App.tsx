import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import Search from "./components/Search";
import Note from "./components/Note";

type Note = {
  author: string;
  content: string;
};

/* const Item = styled(Paper)(({ theme }) => ({
 *   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
 *   ...theme.typography.body2,
 *   padding: theme.spacing(1),
 *   textAlign: 'center',
 *   color: theme.palette.text.secondary,
 * }));
 *
 *  */
const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Box display="flex" flexDirection="column">
      <Grid container spacing={2}>
        {!!error && <Grid xs={12} md={12}>
            <Alert severity="error">{error}</Alert>
        </Grid>}
        <Grid xs={12} md={12}>
          <Search
              setNotes={setNotes}
              keyword={keyword}
              setKeyword={setKeyword}
              setLoading={setLoading}
              setError={setError}
          />
        </Grid>

        <Grid xs={12} md={12}>
              <Divider />
      </Grid>

        {!!loading && <Grid xs={12} md={12} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
        </Grid>}
        {notes.length > 0 && notes.map((note: Note, idx: number) => (
          <Grid xs={12} md={4} key={idx}>
            <Note
                note={note}
                index={idx}
                keyword={keyword}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default App;
