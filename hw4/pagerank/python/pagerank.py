import networkx as nx

G = nx.read_edgelist("../EdgeList.txt", create_using=nx.DiGraph())
pagerank = nx.pagerank(G, alpha=0.85, personalization=None, max_iter=30, tol=1e-06, nstart=None, weight='weight',
                       dangling=None)

outputFile = 'external_pageRankFile'
with open(outputFile, mode='w') as f:
    for node in pagerank:
        node_pagerank = str(pagerank[node])
        f.write(f"/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data/latimes/latimes/{node}={node_pagerank}\n")
