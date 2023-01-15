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
  keywords: string[];
}

const Note = ({ note, index, keywords }: NoteProps) => {
    var noteContent = note.content;
    for (let idx in keywords) {
        const word = keywords[idx];
        noteContent = noteContent.replaceAll(word, `<code class="highlight">${word}</code>`)
    }

    return (
        <Grid spacing={2}>
            {" "}
            <Card>
            <CardContent>
                <Typography sx={{ fontSize: 12 }} color="text.secondary">
                {note.author}
                </Typography>
                <Typography variant="body2">
                <div>{ReactHtmlParser(noteContent)}</div>
                </Typography>
            </CardContent>
            </Card>
        </Grid>
        );
}

export default Note;
