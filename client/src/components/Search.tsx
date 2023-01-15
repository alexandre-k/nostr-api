import React, { useEffect, useState } from "react";
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
    keywords: string[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    setKeywords: (words: string[]) => void;
    setTotalNotes: (total: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
}

function Search({ setNotes, keywords, currentPage, setKeywords, setCurrentPage, setTotalNotes, setLoading, setError }: SearchProps) {
  const searchKeywords = async (kw: string[], currentPage: number) => {
    if (!!kw) {
      setLoading(true);
      setError("");
      const keywordsQuery = kw.map((k, idx) => {
          if (idx == 0) {
              return "keywords=" + k
          } else {
              return "&keywords=" + k
          }
      })
      await axios.get("/api/v1/notes/filter?" + keywordsQuery.join("") + "&page=" + Number(currentPage - 1)).then((res) => {
          setNotes(res.data.notes);
          setTotalNotes(res.data.total);
          setLoading(false);
      })
        .catch(err => {
            console.log(err);
            setNotes([]);
            setTotalNotes(0);
            setError(`${err.code}: ${err.message}`);
            setLoading(false)
        });
    }
  };

  useEffect(() => {
      searchKeywords(keywords, currentPage);
  }, [currentPage])

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
          value={keywords.join(" ")}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKeywords(event.target.value.split(" "))}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
                searchKeywords(keywords, currentPage);
                setCurrentPage(currentPage);
            }
          }}
        />
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          disabled={!keywords}
          onClick={() => {
            searchKeywords(keywords, currentPage);
            setCurrentPage(currentPage);
          }}
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
