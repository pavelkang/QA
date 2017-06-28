import json
import re

# Maps short-name to actual names
topic2name = {
    'ml': 'Machine Learning',
    'ml-basics': 'Machine Learning Basics',
    'dl-basics': 'Deep Learning Basics',
    'supervised-learning': 'Supervised Learning',
    'basics': 'Basics',
    'programming': 'Programming',
    'python': 'Python',
    'misc': 'Misc.',
}

ID = 0

class QA(object):

    def __init__(self, data):
        global ID
        self.q = data['q']
        self.a = data['a']
        self.slug = data['slug']
        self.id = ID
        ID += 1
        self._prepare()

    def _replace_linkable_id(self, content):
        p = re.compile('\(@\d+\)')
        newAnswer = ""
        til_index = 0
        for match in p.finditer(content):
            start, end = match.span()
            formatted_url = '({}/{})'.format(self.slug, content[start+1:end-1])
            newAnswer += content[til_index:start] + formatted_url
            til_index = end
        if til_index < len(content):
            newAnswer += content[til_index:]
        return newAnswer

    def _prepare(self):
        """
        Prepare answer
        """
        for i in xrange(len(self.a)):
            if self.a[i]['type'] == 'md':
                self.a[i]['content'] = self._replace_linkable_id(self.a[i]['content'])

    def serialize(self):
        return {
            'q': self.q,
            'a': self.a,
            'id': str(self.id),
        }


class Topic(object):

    def __init__(self, name):
        self.name = name

    def serialize(self):
        return jsonify({
            'name': self.name,
        })

def next_key(k):
    if k == 'q':
        return 'slug'
    elif k == 'a':
        return 'q'
    elif k == 'slug':
        return 'a'
    assert(False)
    return None


class TopicGraph(object):

    def __init__(self):
        self.nodes = dict()

    def add_node(self, code):
        if code not in self.nodes:
            self.nodes[code] = set()

    def add_edge(self, parent, child):
        assert(parent in self.nodes)
        assert(child in self.nodes)
        self.nodes[parent].add(child)

def find_prefix_slugs(slug):
    pres = []
    for i in xrange(1, len(slug)):
        if slug[i] == '/':
            pres.append(slug[:i])
    return pres


def last_topic(slug):
    for i in xrange(len(slug)-1, -1, -1):
        if slug[i] == '/':
            return slug[i+1:]
    assert(False)


def find_index(li, it):
    try:
        i = li.index(it)
        return i
    except:
        return -1

def replace_id_link(s):
    pass

key = 'q'
tmp_data = dict()
QAs = []
g = TopicGraph()
slugs = dict() # slug : b (True if it is a leaf slug)
slugs['/'] = False

def create_content(t, c):
    return {
        "type": t,
        "content": c,
    }

def main():
    separator = "---"
    code_separator = "```"
    with open("/Users/kai/GitBook/Library/pavelkang/machine-learning-questions/what-is-ax+b.md") as f:
        data = f.readlines()
        data = map(lambda s: s.rstrip(), data)
        data = map(lambda s: s.replace("$$", "$"), data)
        startIdx = 0
        endIdx = find_index(data[1:], separator) + 1
        if endIdx == 0:
            return
        #assert(data[0] == separator)

        while endIdx < len(data):
            content = data[startIdx+1 : endIdx]

            # parse content
            q = content[1]
            slug = content[3]
            a = content[5:]

            # add nodes, edges to graph
            codes = slug.split('/')
            for code in codes:
                g.add_node(code)
            for i in xrange(len(codes)-1):
                g.add_edge(codes[i], codes[i+1])
            # add to slugs
            for p in find_prefix_slugs(slug):
                slugs[p] = False
            slugs[slug] = True

            answer = []
            idx = 0
            partial_content = ""
            while idx < len(a):
                if a[idx].startswith(code_separator):
                    answer.append(create_content("md", partial_content))
                    partial_content = ""
                    code_end_idx = a[idx+1:].index(code_separator) + idx + 1
                    code = "\n".join(a[idx+1: code_end_idx])
                    answer.append(create_content("code", code))
                    idx = code_end_idx + 1
                else:
                    partial_content += a[idx]
                    partial_content += "\n"
                    idx += 1
            answer.append( create_content("md", partial_content) )

            QAs.append( QA({'q': q, 'a': answer, 'slug': slug}) )

            startIdx = endIdx
            nextIdx = find_index(data[endIdx+1:], separator)
            if nextIdx == -1:
                break
            endIdx = nextIdx + endIdx + 1

main()

response = dict()

for slug in slugs:
    if slugs[slug]: # leaf slug
        response[slug] = [qa.serialize() for qa in QAs if qa.slug == slug]
    else:
        topic = last_topic(slug)
        response[slug] = [{'name': topic2name[t], 'code': t} for t in g.nodes[topic]]

id2slug = dict()
for qa in QAs:
    id2slug[str(qa.id)] = qa.slug
response['id2slug'] = id2slug

print json.dumps(response, sort_keys=True, indent=4, separators=(',', ': '))

# print json.dumps(response)
