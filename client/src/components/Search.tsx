import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

type Note = {
  author: string;
  content: string;
};

interface SearchProps {
  setNotes: (notes: Note[]) => void;
    keyword: string;
    setKeyword: (word: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
}

function Search({ setNotes, keyword, setKeyword, setLoading, setError }: SearchProps) {
  const searchKeyword = async (keyword: string) => {
    if (!!keyword) {
      setLoading(true);
      setError("");
      await axios.get("/api/v1/notes/filter?keyword=" + keyword).then((res) => {
          setNotes(res.data);
          setLoading(false);
      })
        .catch(err => {
            console.log(err);
            setError(`${err.code}: ${err.message}`);
            setLoading(false)
        });
    }
  };

  return (
    <Box
      height="25vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ flexGrow: 1 }}
    >
      <Stack direction="row" spacing={2}>
        <TextField
          id="outlined-name"
          label="Search on Nostr"
          value={keyword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setKeyword(event.target.value)
          }
          onKeyPress={(event) => {
            if (event.key === "Enter") searchKeyword(keyword);
          }}
        />
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          disabled={!keyword}
          onClick={() => searchKeyword(keyword)}
          onKeyPress={(event) => {
            if (event.key === "Enter") console.log("Enter Pressed");
          }}
        >
          <SearchIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default Search;
