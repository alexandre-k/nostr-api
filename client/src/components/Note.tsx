import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import ReactHtmlParser from 'react-html-parser';
import "./Note.css"


type NoteT = {
  author: string;
  content: string;
};

interface NoteProps {
  note: NoteT;
  index: number;
  keyword: string;
}

const Note = ({ note, index, keyword }: NoteProps) => (
  <Grid spacing={2}>
    {" "}
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 12 }} color="text.secondary">
          {note.author}
        </Typography>
        <Typography variant="body2">
          <div>{ReactHtmlParser(note.content.replaceAll(keyword, `<code class="highlight">${keyword}</code>`))}</div>
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

export default Note;
