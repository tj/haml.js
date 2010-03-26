
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
    
    describe '%tag'
      it 'should work with no text or block'
        assert('tag.simple')
      end
      
      it 'should work with text'
        assert('tag.text')
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
    end
    
    describe 'nesting'
      it 'should work when nested downwards'
        assert('nesting.simple')
      end
    end
  end
end