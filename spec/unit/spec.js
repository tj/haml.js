
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
        if (html !== expected) {
          fail(name + '.haml does not match ' + name + '.html\ngot:\n' + html + '\n\nexpected:\n' + expected)
        }
      }
    end
    
    describe 'nesting'
      it 'should work when nested downwards'
        assert('nesting.simple')
      end
    end
  end
end