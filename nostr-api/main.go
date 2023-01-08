package main

import "fmt"
import "log"
import "github.com/nbd-wtf/go-nostr"
import "github.com/gin-gonic/gin"


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

func main() {
	router := gin.Default()
	router.GET("/notes", fetchNotes)
	router.Run("0.0.0.0:8080")
}
