#!/usr/bin/env python

import urllib2
import json
from collections import namedtuple
import string
import random
   
 
class CollectionManager(object):
    
    def __init__(self, solr_url, solr_key):
        url = '{0}/query?facet.field=collection_data&facet=on&rows=0&facet.limit=-1'.format(
            solr_url
        )
        req = urllib2.Request(url, None, { 'X-Authentication-Token': solr_key  })
        self.data = json.loads(urllib2.urlopen(req).read())['facet_counts']['facet_fields']['collection_data'][::2]
        self.parse()
 
 
    def parse(self):
        def sort_key(collection_link):
            return collection_link.label.translate({ord(c): None for c in string.punctuation}).upper()
 
        CollectionLink = namedtuple('CollectionLink', 'url, label') 
 
        self.parsed = sorted(
            [CollectionLink(*x.rsplit('::')) for x in self.data],
            key=sort_key
        )
        
        random.seed('seed')
 
        self.shuffled = random.sample(self.parsed, len(self.parsed))
 
 
"""
Copyright (c) 2015, Regents of the University of California
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
- Neither the name of the University of California nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
"""
