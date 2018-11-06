
# ILP-CEPA Protocol2 

## Overview

ILP-CEPA is a protocol that uses onion routing as a network overlay to privately route execution conditions for off-chain ILP transactions. The original ILP protocol can be found [here](https://github.com/interledger).

## Phases
1. Onion Routing Setup 
 - Choose >1 ILP nodes to act as Onion Routers (ORs)
 - Find ILP addresses of each OR along the route. 
 - Establish shared secrets with each OR. 
2. Source-Destination Setup
	- Choose *Destination* and amount to send
	- Pre-image Hash Exchange
3. Routing 
    Routing A: 
    - Use this circuit as a VPN 
    Routing B: 
    - Use this circuit as a TOR relay 
	- ...

## Protocol Outline
### 1. Routing Setup 
 - Choose >1 ILP nodes to act as Onion Routers (ORs)
    - TOR does this with the help of a distributed directory service. However, this is a non-trivial problem, and it's hard to nail down exactly how to locate the directory, how to guarantee nodes can trust it, how new nodes can add/update/delete themselves from the directory, etc. and it's probably out of the scope of our project. Besides, it's not the interesting part of what we're working on anyways. For this project, we could hardcode a list of Onion-compatible nodes into each of the nodes, and not worry about designing a directory service. 
 - Find ILP addresses and established shared secrets with each OR along the route. 
    - You can get the ILP addresses from the hardcoded list as detailed above. To establish shared secrets, you need some sort of public key infrastructure, which Interledger doesn't have. Designing our own PKI with Interledger is out of the scope of our project, so it's not worth doing. Also, it's something Evan is personally working on. 
    - Instead, we could just establish SPSP connections between the sender and each of the ORs, and run DHE key exchange over SPSP to establish shared keys. SPSP runs over HTTPS, so it leverages the PKI of the Internet. This means that a passive observer could see the traffic between the source and the ORs, and learn an unordered list of the ORs on the route, but defending against that would involve building custom PKI, which isn't worth us doing. 
    

A single onion routed hop represents over potentially several ILP hops.

![Uh oh...](images/basic_diagram.png)

The protocol should support two kinds of interactions:

### Option A: ILP Over STREAM over ILP (VPN style)

1)  We establish a STREAM connection between Source and OR1, OR1 and OR2, OR_i and OR_i+1, and OR_n and Destination. 
STREAM has a way to send arbitrary data and/or money over a connection. 
(1) Source sends a packet over STREAM, where the data payload resembles an ILP prepare statement. This gets routed (over STREAM over ILP) to OR1. 
(2) OR1 sends a prepare statement over STREAM over ILP to OR2. etc. etc. 
(3) propagate fulfils backwards. 
(4) resolve the money at eaach step. 

### Option B: Onion-routing Over STREAM over ILP (TOR style)
Here, the sender is directly sending money/data to the destination. 
The sender creates a payload which encodes this money/data. 
The sender onion wraps this payload with the keys of all the ORs on the path. 
The sender sends this payload over STREAM. 
The Onion Routers unwrap and pass the message along until it reaches the destination.

## Threat Model

### Network Adversaries

The protocol makes the following assumptions on network adversaries:

- Off-route passive observers constantly monitor traffic from every on-route node.
- Every ILP node can retain message information for an indefinite amount of time.
- ILP nodes may be controlled by adversaries, but it is statistically unlikely that all nodes along the path are controlled by the same adversary. 
### Security Guarantees

- Participants in a route don't know their exact position within the route
- Participants within a route don't know the source of the payment, nor the ultimate destination of the payment
- Participants within a route aren't away exactly how many other participants were involved in the payment route
- Participants within a route don't even know that they are within a route! That is to say, an ILP node running Onion Routing compatible software cannot tell whether the packets it is passing along Onion Routed packets or regular STREAM packets... If we can prove this, that'd be pretty cool. The internet today, it's pretty obvious to tell that you're using TOR, just because the protocols are so different from, say, VPN protocols. But in this model, the traffic would be indistinguishable, even to an on path Onion Router. 

- Ephemeral Diffie–Hellman for forward secrecy
- 

This protocol is **NOT** secure against timing analysis or *OR* collusion.

## Packet Structure
- We need to ensure that 'VPN' style packets are indistinguishable from TOR style packets. At the very least, this means padding to equal length, but it might involve more careful consideration. A good thing to add to our testing strategy would be setting up an adversary who intercepts both styles of packets, and tries to distinguish them based on various properties.

### Payload Construction

## Other Details

