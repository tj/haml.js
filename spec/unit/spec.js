
describe 'haml'
  describe '.version'
    it 'should be a triplet'
      haml.version.should.match(/^\d+\.\d+\.\d+$/)
    end
  end
  
  describe '.render()'
    before
      assert = function(name) {
        var html = haml.render(fixture(name + '.haml')).trim(),
            expected = fixture(name + '.html').trim()
        if (html === expected)
          pass()
        else
          fail('got:\n' + html + '\n\nexpected:\n' + expected)
      }
    end
    
    describe '.class'
      it 'should output a div with the given class'
        assert('class')
      end
      
      it 'should work with several classes'
        assert('classes')
      end
    end
    
    describe '#id'
      it 'should output a div with the given id'
        assert('id')
      end
    end
    
    describe '%tag'
      it 'should work with no text or block'
        assert('tag.simple')
      end
      
      it 'should work with text'
        assert('tag.text')
      end
      
      it 'should work with block text'
        assert('tag.text.block')
      end
      
      it 'should work with blocks of text and tags'
        assert('tag.text.block.complex')
      end
      
      it 'should work with many classes / ids / attrs'
        assert('tag.complex')
      end
    end
    
    describe '%tag.class'
      it 'should output tag with a class'
        assert('tag.class')
      end
      
      it 'should work with several classes'
        assert('tag.classes')
      end
      
      it 'should support self-closing tags'
        assert('tag.self-close')
      end
    end
    
    describe '%tag='
      it 'should output the evaluated code'
        assert('tag.code')
      end
      
      it 'should not escape output'
        assert('tag.code.no-escape')
      end
    end
    
    describe '%tag&='
      it 'should escape the evaluated code'
        assert('tag.escape')
      end
    end
    
    describe '{...}'
      it 'should be mapped as html attributes'
        assert('tag.attrs')
      end
      
      it 'should escape values'
        assert('tag.attrs.escape')
      end
      
      it 'should allow booleans'
        assert('tag.attrs.bools')
      end
    end
    
    describe '!!!'
      it 'should default the doctype to 1.0 transitional'
        assert('doctype')
      end
    end
    
    describe '!!! NAME'
      it 'should output a specific doctype'
        assert('doctype.xml')
      end
      
      it 'should be case-insensitive'
        assert('doctype.xml.case')
      end
    end
    
    describe 'nesting'
      it 'should work when nested downwards'
        assert('nesting.simple')
      end
      
      it 'should work when blocks dedent'
        assert('nesting.complex')
      end
    end
    
    describe '- code'
      it 'should work with if statements'
        assert('code.if')
      end
      
      it 'should work when nested'
        assert('code.nested')
      end
    end
    
    describe '= code'
      it 'should output evaluation'
        assert('code')
      end
    end
    
    describe '&= code'
      it 'should output evaluation while escaping html entities'
        assert('code.escape')
      end
    end
    
    describe '<literal></html>'
      it 'should remain intact'
        assert('html')
      end
    end
    
    describe '\\char'
      it 'should escape the character'
        assert('escape')
      end
    end
    
    describe '-#'
      it 'should become a silent comment'
        assert('comment')
      end
    end
    
    describe '/'
      it 'should comment out tags'
        assert('comment.tag')
      end
      
      it 'should comment out blocks'
        assert('comment.block')
      end
      
      it 'should comment out text'
        assert('comment.text')
      end
    end
    
    describe ':filter'
      describe 'cdata'
        it 'should wrap with CDATA tags'
          assert('filter.cdata')
        end
        
        it 'should retain whitespace'
          assert('filter.cdata.whitespace')
        end
      end
      
      describe 'javascript'
        it 'should wrap with <script> and CDATA tags'
          assert('filter.javascript')
        end
      end
    end
    
  end
end