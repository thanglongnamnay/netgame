/**
 * lobby server
 * create a lobby
 * player find room -> get available room -> join
 * start 5 sec after room full
 * send room uuid, start time back to players
 * discard tcp connection
 *
 * battle server
 * players will send uuid to server in every package
 * broadcast client msg to all rooms
 * room will discard msg with different uuid
 * proceed
 */