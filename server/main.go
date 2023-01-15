package main

import (
	"os"
	"fmt"
	"net/http"
	"encoding/json"
	"strconv"
	"log"
	"database/sql"
	"github.com/nbd-wtf/go-nostr"
	_ "github.com/mattn/go-sqlite3"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/contrib/static"
)


type NotesResponse struct{
	Notes []map[string]string `json:"notes"`
	Total int `json:"total"`
}


func fetchNotes(c *gin.Context) {
	fmt.Println("Fetch notes")
	relay, err := nostr.RelayConnect(c, "wss://nostr.lnprivate.network")
	if err != nil {
		fmt.Println("Error: ", err)
	}

	events := relay.QuerySync(c, nostr.Filter{Limit: 100})

	for _, event := range events {
		log.Println(event.Content)
		// var nostrEvent = event.MarshalJSON()
		// var nostrEvent = &nostr.Event(event)
		// log.Printf("event: '%s'\n", nostrEvent)
	}
}

func filterNotesContent(c *gin.Context) {
	c.Header("Content-Type", "application/json")
	nostrDb := os.Getenv("NOSTR_DB_PATH")
	// If environment variable not set, use local db
	if nostrDb == "" {
		nostrDb = "./nostr.db"
	}
	db, err := sql.Open("sqlite3", nostrDb)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Unable to find db.",
		})
		return
	}

	defer db.Close()

	keywords := c.Request.URL.Query()["keywords"]
	fmt.Println("Keywords . ", keywords)

	var whereFilter string

	for index, keyword := range keywords {
		if index == 0 {
			whereFilter += fmt.Sprintf("content like '%%%s%%'", keyword)
		} else {
			whereFilter += fmt.Sprintf(" and content like '%%%s%%'", keyword)
		}
	}
	page := c.Query("page")

	cnv, err := strconv.Atoi(page)
	offset := cnv - 1

	if err != nil {
	    c.JSON(http.StatusBadRequest, gin.H{
		    "message": "Page given incorrect.",
	    })
	    return
	}
	paging := 100

	if len(keywords) == 0 {
		c.JSON(http.StatusOK,
			NotesResponse{Notes: make([]map[string]string, 0), Total: 0})
		return
	}
	sqlCount := fmt.Sprintf("SELECT COUNT(content) FROM event WHERE %s ORDER BY created_at", whereFilter)
	fmt.Println("Count SQL: ", sqlCount)
	pageCount, err := db.Prepare(sqlCount)
	if err != nil {
		fmt.Println(err)
		log.Fatal(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err,
		})
		return
	}
	defer pageCount.Close()

	var pageNum int
	err = pageCount.QueryRow().Scan(&pageNum)
	if err != nil {
		log.Fatal(err)
	}

	if pageNum < paging * offset {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err,
		})
		return
	}

	sqlNotes := fmt.Sprintf("SELECT content FROM event WHERE %s ORDER BY created_at LIMIT %d,%d", whereFilter, offset * paging, paging)
	fmt.Println("Notes SQL: ", sqlNotes)
	eventRows, err := db.Prepare(sqlNotes)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusOK,
			NotesResponse{Notes: make([]map[string]string, 0), Total: 0})
		return
	}

	// var nostrEvents []nostr.Event

	//var result string
	rows, err := eventRows.Query()//.Scan(&result)
	if err != nil {
		log.Fatal(err)
	}

	defer eventRows.Close()

	// i := 0
	var result = make([]map[string]string, 0)
	for rows.Next() {
		var event string
		err = rows.Scan(&event)
		fmt.Println("rows er ", err)
		if err != nil {
			log.Fatal(err)
		}
		// fmt.Println("Event: ", event)
		var nostrEvent nostr.Event
		json.Unmarshal([]byte(event), &nostrEvent)
		result = append(result, map[string]string{"author": nostrEvent.PubKey, "content": nostrEvent.Content})
	}
	c.JSON(http.StatusOK, NotesResponse{Notes: result, Total: pageNum})
}

func main() {
	router := gin.Default()
	router.GET("/")

	// Serve frontend static files
	router.Use(static.Serve("/app", static.LocalFile("/app/client/build", true)))
	router.Use(static.Serve("/static", static.LocalFile("/app/client/build/static", true)))
	api := router.Group("/api/v1")
	{
		api.GET("/notes", fetchNotes)
		api.GET("/notes/filter", filterNotesContent)
	}
	router.Run("0.0.0.0:8000")
}
