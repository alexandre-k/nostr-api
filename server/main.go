package main

import (
	"os"
	"fmt"
	"net/http"
	"encoding/json"
	"log"
	"database/sql"
	"github.com/nbd-wtf/go-nostr"
	_ "github.com/mattn/go-sqlite3"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/contrib/static"
)



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
	db, err := sql.Open("sqlite3", nostrDb)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Need a keyword as parameter to filter text data.",
		})
		return
	}
	stm, err := db.Prepare(fmt.Sprintf("SELECT content FROM event WHERE content like '%%%s%%'", keyword))
	if err != nil {
		log.Fatal(err)
	}

	rows, err := stm.Query()
	if err != nil {
		log.Fatal(err)
	}

	defer rows.Close()

	i := 0
	var result []map[string]string
	for rows.Next() {
		i++
		var event string
		err = rows.Scan(&event)
		if err != nil {
			log.Fatal(err)
		}
		var nostrEvent nostr.Event
		json.Unmarshal([]byte(event), &nostrEvent)
		result = append(result, map[string]string{"author": nostrEvent.PubKey, "content": nostrEvent.Content})
		log.Printf("%d ==> %s", i, nostrEvent.Content)
	}
	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

func main() {
	router := gin.Default()
	router.GET("/")

	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("./client/build", true)))
	api := router.Group("/api/v1")
	{
		api.GET("/notes", fetchNotes)
		api.GET("/notes/filter", filterNotesContent)
	}
	router.Run("0.0.0.0:8080")
}
