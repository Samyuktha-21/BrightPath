#include <bits/stdc++.h>
using namespace std;

/* Huffman Tree Node */
struct Node {
    char ch;
    int freq;
    Node *left, *right;

    Node(char c, int f) {
        ch = c;
        freq = f;
        left = right = nullptr;
    }
};

/* Comparator for Min Heap */
struct Compare {
    bool operator()(Node* a, Node* b) {
        return a->freq > b->freq;
    }
};

/* Generate Huffman Codes */
void generateCodes(Node* root, string code,
                   unordered_map<char, string> &codes) {
    if (!root) return;

    if (!root->left && !root->right) {
        codes[root->ch] = code;
        return;
    }

    generateCodes(root->left, code + "0", codes);
    generateCodes(root->right, code + "1", codes);
}

/* Build Huffman Tree using Greedy Approach */
Node* buildHuffmanTree(unordered_map<char, int> &freq) {
    priority_queue<Node*, vector<Node*>, Compare> pq;

    for (auto &p : freq) {
        pq.push(new Node(p.first, p.second));
    }

    while (pq.size() > 1) {
        Node* left = pq.top(); pq.pop();
        Node* right = pq.top(); pq.pop();

        Node* merged = new Node('\0', left->freq + right->freq);
        merged->left = left;
        merged->right = right;

        pq.push(merged);
    }

    return pq.top();
}

int main() {
    string S;
    int k;

    cout << "Enter string S: ";
    cin >> S;

    cout << "Enter update interval k: ";
    cin >> k;

    int n = S.length();
    long long L = 0;

    unordered_map<char, int> freq;
    unordered_map<char, string> codes;

    /* Adaptive Encoding */
    for (int t = k; t <= n; t += k) {

        /* Update frequency up to t */
        freq.clear();
        for (int i = 0; i < t; i++) {
            freq[S[i]]++;
        }

        /* Build Huffman Tree */
        Node* root = buildHuffmanTree(freq);

        /* Generate codes */
        codes.clear();
        generateCodes(root, "", codes);

        /* Encode current block */
        for (int i = t - k; i < t; i++) {
            L += codes[S[i]].length();
        }
    }

    /* Final Huffman Codes using full string */
    freq.clear();
    for (char c : S)
        freq[c]++;

    Node* finalRoot = buildHuffmanTree(freq);
    codes.clear();
    generateCodes(finalRoot, "", codes);

    cout << "\nFinal Huffman Codes Cn(x):\n";
    for (auto &p : codes) {
        cout << p.first << " : " << p.second << endl;
    }

    cout << "\nTotal Encoded Length L = " << L << " bits\n";

    return 0;
}
