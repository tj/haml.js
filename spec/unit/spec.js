
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
          fail(name + '.haml does not match ' + name + '.html\ngot:\n' + html + '\n\nexpected:\n' + expected)
      }
    end
    
    describe 'tags'
      it 'should work with no text or block'
        assert('tag.simple')
      end
      
      it 'should work with text'
        assert('tag.text')
      end
    end
    
    describe 'nesting'
      it 'should work when nested downwards'
        assert('nesting.simple')
      end
    end
  end
end